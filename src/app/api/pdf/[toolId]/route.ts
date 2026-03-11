import { NextResponse } from "next/server";
import * as pdfTools from "@/lib/pdf-tools";
import { StorageService } from "@/services/storage.service";
import { ConversionService } from "@/services/conversion.service";
import { PopplerService } from "@/services/engines/poppler.service";
import { ImagemagickService } from "@/services/engines/imagemagick.service";
import { LibreOfficeService } from "@/services/engines/libreoffice.service";
import { TesseractService } from "@/services/engines/tesseract.service";
import { UsageService, LimitExceededError } from "@/services/usage.service";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;
    const userRole = session?.user ? (session.user as any).role : "USER";

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const resolvedParams = await params;
    const toolId = resolvedParams.toolId;

    // Usage tracking only, enforcement is disabled globally
    let userPlan: PlanId = "infinity"; // default to highest tier capability
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (user?.plan) userPlan = user.plan as PlanId;
    }
    await UsageService.enforceToolLimits(userId, userPlan, toolId, files, userRole);
    
    // 2. Initial Storage and Database Tracking
    const savedFilePaths = [];
    for (const file of files) {
      const savedPath = await StorageService.saveUploadedFile(file);
      savedFilePaths.push(savedPath);

      await prisma.fileRecord.create({
        data: {
          userId,
          fileName: file.name,
          savedPath,
          fileSize: file.size,
          mimeType: file.type || "application/pdf",
        }
      });
    }

    // Run cleanup asynchronously
    StorageService.cleanupOldFiles().catch(console.error);

    const arrayBuffers = await Promise.all(files.map(f => f.arrayBuffer()));
    
    let resultBuffer: Uint8Array;

    switch (toolId) {
      // Editing
      case "merge": resultBuffer = await pdfTools.mergePdf(arrayBuffers); break;
      case "split": resultBuffer = await pdfTools.splitPdf(arrayBuffers[0]); break;
      case "compress": resultBuffer = await pdfTools.compressPdf(arrayBuffers[0]); break;
      case "rotate": resultBuffer = await pdfTools.rotatePdf(arrayBuffers[0]); break;
      case "delete-pages": resultBuffer = await pdfTools.deletePages(arrayBuffers[0]); break;
      case "reorder": resultBuffer = await pdfTools.reorderPages(arrayBuffers[0]); break;
      case "watermark": resultBuffer = await pdfTools.watermarkPdf(arrayBuffers[0]); break;
      case "remove-watermark": resultBuffer = await pdfTools.removeWatermark(arrayBuffers[0]); break;
      case "page-numbers": resultBuffer = await pdfTools.addPageNumbers(arrayBuffers[0]); break;
      case "header-footer": resultBuffer = await pdfTools.headerFooter(arrayBuffers[0]); break;
      case "edit-text": resultBuffer = await pdfTools.editTextPdf(arrayBuffers[0]); break;
      case "highlight": resultBuffer = await pdfTools.highlightPdf(arrayBuffers[0]); break;
      case "annotate": resultBuffer = await pdfTools.annotatePdf(arrayBuffers[0]); break;
      case "sign": resultBuffer = await pdfTools.signPdf(arrayBuffers[0]); break;
      case "fill-forms": resultBuffer = await pdfTools.fillForms(arrayBuffers[0]); break;
      case "protect": resultBuffer = await pdfTools.protectPdf(arrayBuffers[0]); break;
      case "unlock": resultBuffer = await pdfTools.unlockPdf(arrayBuffers[0]); break;
      case "redact": resultBuffer = await pdfTools.redactPdf(arrayBuffers[0]); break;
      case "crop": resultBuffer = await pdfTools.cropPdf(arrayBuffers[0]); break;
      case "extract": resultBuffer = await pdfTools.extractPages(arrayBuffers[0]); break;
      
      // Conversion
      case "pdf-to-word": resultBuffer = await pdfTools.pdfToWord(arrayBuffers[0]); break;
      case "word-to-pdf": resultBuffer = await LibreOfficeService.documentToPdf(arrayBuffers[0], files[0].name.split(".").pop() || "docx"); break;
      case "pdf-to-jpg": resultBuffer = await PopplerService.pdfToFormat(arrayBuffers[0], "jpeg"); break;
      case "jpg-to-pdf": resultBuffer = await ImagemagickService.imagesToPdf(arrayBuffers, files.map(f => f.name)); break;
      case "pdf-to-png": resultBuffer = await PopplerService.pdfToFormat(arrayBuffers[0], "png"); break;
      case "png-to-pdf": resultBuffer = await ImagemagickService.imagesToPdf(arrayBuffers, files.map(f => f.name)); break;
      case "pdf-to-excel": resultBuffer = await pdfTools.pdfToExcel(arrayBuffers[0]); break;
      case "excel-to-pdf": resultBuffer = await LibreOfficeService.documentToPdf(arrayBuffers[0], files[0].name.split(".").pop() || "xlsx"); break;
      case "pdf-to-ppt": resultBuffer = await pdfTools.pdfToPpt(arrayBuffers[0]); break;
      case "ppt-to-pdf": resultBuffer = await LibreOfficeService.documentToPdf(arrayBuffers[0], files[0].name.split(".").pop() || "pptx"); break;
      case "pdf-to-text": resultBuffer = await pdfTools.pdfToText(arrayBuffers[0]); break;
      case "html-to-pdf": resultBuffer = await pdfTools.htmlToPdf(arrayBuffers[0]); break;
      
      // Optimization
      case "compress-pdf": resultBuffer = await ConversionService.compressPdfUsingGS(arrayBuffers[0]); break;
      case "repair": resultBuffer = await pdfTools.repairPdf(arrayBuffers[0]); break;
      case "reduce-size": resultBuffer = await pdfTools.reduceSize(arrayBuffers[0]); break;
      case "optimize-web": resultBuffer = await pdfTools.optimizeWeb(arrayBuffers[0]); break;
      case "ocr-pdf": resultBuffer = await TesseractService.ocrPdf(arrayBuffers[0]); break;

      default:
        // Allow fallback for old routes mapped in original code
        if (toolId === "comments") { resultBuffer = await pdfTools.commentsPdf(arrayBuffers[0]); break; }
        if (toolId === "shapes") { resultBuffer = await pdfTools.shapesPdf(arrayBuffers[0]); break; }
        if (toolId === "stamps") { resultBuffer = await pdfTools.stampsPdf(arrayBuffers[0]); break; }
        return NextResponse.json({ error: "Unknown tool: " + toolId }, { status: 400 });
    }

    // Determine return headers
    let contentType = "application/pdf";
    let ext = ".pdf";
    if (toolId === "pdf-to-word" || toolId === "pdf-to-ppt" || toolId === "pdf-to-text") { contentType = "text/plain"; ext = ".txt"; } 
    if (toolId === "pdf-to-jpg") { contentType = "image/jpeg"; ext = ".jpg"; }
    if (toolId === "pdf-to-png") { contentType = "image/png"; ext = ".png"; }
    if (toolId === "pdf-to-excel") { contentType = "text/csv"; ext = ".csv"; }

    // 3. Save Final processed output
    const processedFilePath = await StorageService.saveProcessedFile(resultBuffer, ext);

    // 4. Log successful Execution metrics & usage
    await prisma.toolUsage.create({
      data: { userId, toolId, status: "SUCCESS" }
    });
    await UsageService.recordUsage(userId, toolId);

    return new NextResponse(resultBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${toolId}-result${ext}"`,
        "X-Processed-File-Path": processedFilePath
      },
    });

  } catch (error: any) {
    console.error(`Error processing PDF:`, error);
    
    // Log failure metrics
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        await prisma.toolUsage.create({
          data: {
            userId: (session.user as any).id,
            toolId: "unknown-failure",
            status: "FAILED",
            errorMessage: error.message
          }
        });
      }
    } catch (e) { /* ignore nested logger fault */ }

    return NextResponse.json(
      { error: "processing_error", message: error.message || "An unexpected error occurred while processing your PDF." },
      { status: 500 }
    );
  }
}
