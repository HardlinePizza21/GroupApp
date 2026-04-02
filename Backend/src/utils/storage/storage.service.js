export const saveFile = async (file) => {
  // LOCAL por ahora
  return {
    url: `/uploads/${file.filename}`,
    type: file.mimetype
  };
};