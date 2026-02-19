import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../app/errorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_API_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.BAD_REQUEST,
      "File buffer or file name is missing",
    );
  }

  const extension = fileName.split(".").pop()?.toLocaleLowerCase();
  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLocaleLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const folder = extension === "pdf" ? "pdfs" : "images";

  return await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: `ph-healthcare/${folder}/${uniqueName}`,
          public_id: uniqueName,
        },
        (error, result) => {
          if (error) {
            reject(
              new AppError(
                status.INTERNAL_SERVER_ERROR,
                "Error uploading file to cloudinary",
              ),
            );
          }
          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

    const match = url.match(regex);

    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    }
  } catch (error) {
    console.log("Error deleting file form cloudinary", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error deleting file form cloudinary",
    );
  }
};

export const cloudinaryUpload = cloudinary;
