import cloudinary from '../config/cloudinary.js';

// Helper to upload a single buffer to Cloudinary
const uploadBufferToCloudinary = async (fileBuffer, mimetype, folder = 'gamevault') => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataURI = `data:${mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: 'auto',
  });
  return result.secure_url;
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const secureUrl = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype);

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: secureUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, file.mimetype)
    );

    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Images uploaded successfully',
      urls,
    });
  } catch (error) {
    console.error('Multiple Upload Error:', error);
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

