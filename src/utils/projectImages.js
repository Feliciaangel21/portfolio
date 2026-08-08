export const getProjectImages = (project) => {
  const images = Array.isArray(project?.Images) ? project.Images.filter(Boolean) : [];
  if (project?.Img && !images.includes(project.Img)) images.unshift(project.Img);
  return images;
};
