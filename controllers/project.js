const fs = require('fs');
const { RequestError, ProjectError } = require('../errors/customError');
const Project = require('../models/project');
const cloudinary = require('../cloudinaryConfig');

const getPublicId = (imageUrl) => imageUrl.split('/').pop().split('.')[0];
const IMAGE_KEY = ['image_cover_large', 'image_cover_medium', 'image_cover_small', 'image_min_large', 'image_min_medium', 'image_min_small'];

exports.getAllProjectImages = async (req, res, next) => {
  try {
    const images = await Project.find().select('image_cover_large image_cover_medium image_cover_small');
    const imagesOject = images.map((image) => ({
      image_cover_large: image.image_cover_large,
      image_cover_medium: image.image_cover_medium,
      image_cover_small: image.image_cover_small,
    }));
    res.json({ data: imagesOject });
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = (req, res, next) => {
  Project.find()
    .then((projects) => {
      res.json({ data: projects });
    })
    .catch((error) => next(error));
};

exports.getProject = async (req, res, next) => {
  try {
    let projectId = req.params.id;
    if (!projectId) {
      throw new RequestError('Missing parameter');
    }

    let project = await Project.findById(projectId);
    if (project === null) {
      throw new ProjectError('This project does not exist');
    }

    return res.json({ data: project });
  } catch (error) {
    next(error);
  }
};

exports.addProject = async (req, res, next) => {
  try {
    const projectObject = JSON.parse(req.body.project);
    const { title, subTitle, description, technologies } = projectObject;
    if (!title || !subTitle || !description || !technologies) {
      throw new RequestError('Missing Data');
    }

    const img = buildImgUrl(projectObject.title);
    const resultCoverLarge = await uploaderImg(`cover_large_${img}`, req.files['image_cover_large'][0].path);
    const resultCoverMedium = await uploaderImg(`cover_medium_${img}`, req.files['image_cover_medium'][0].path);
    const resultCoverSmall = await uploaderImg(`cover_small_${img}`, req.files['image_cover_small'][0].path);
    const resultCoverMinLarge = await uploaderImg(`min_large_${img}`, req.files['image_min_large'][0].path);
    const resultCoverMinMedium = await uploaderImg(`min_medium_${img}`, req.files['image_min_medium'][0].path);
    const resultCoverMinSmall = await uploaderImg(`min_small_${img}`, req.files['image_min_small'][0].path);

    delete projectObject._id;
    const newProject = new Project({
      ...projectObject,
      image_cover_large: `${resultCoverLarge}`,
      image_cover_medium: `${resultCoverMedium}`,
      image_cover_small: `${resultCoverSmall}`,
      image_min_large: `${resultCoverMinLarge}`,
      image_min_medium: `${resultCoverMinMedium}`,
      image_min_small: `${resultCoverMinSmall}`,
    });

    await newProject.save();

    return res.status(201).json({ message: `The project ${title} created` });
  } catch (error) {
    next(error);
  }
};

const uploaderImg = async (imgName, path) => {
  const resultCover = await cloudinary.uploader.upload(path, {
    folder: 'porfolio-hanh',
    resource_type: 'image',
    public_id: imgName,
  });
  return resultCover.secure_url;
};

const buildImgUrl = (projectTitle) => {
  return `${projectTitle.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
};

const processImage = async (files, propertyName, imageType, img) => {
  if (files[imageType]) {
    const result = await uploaderImg(`${propertyName}_${img}`, files[imageType][0].path);
    return result;
  }
  return null;
};
const extractPart = (fullString) => {
  const parts = fullString.split('_');
  return parts.slice(1).join('_');
};

exports.updateProject = async (req, res, next) => {
  try {
    let projectId = req.params.id;
    if (!projectId) {
      throw new RequestError('Missing parameter');
    }

    let project = await Project.findById(projectId);
    if (project === null) {
      throw new ProjectError('This project does not exist !', 404);
    }

    let projectObject = JSON.parse(req.body.project);

    if (req.files && Object.keys(req.files).length > 0) {
      const img = buildImgUrl(projectObject.title);
      for (const imageType of IMAGE_KEY) {
        const propertyName = extractPart(imageType);
        const result = await processImage(req.files, propertyName, imageType, img);
        if (result) {
          projectObject[`image_${propertyName}`] = result;
        }
      }
    }
    await Project.updateOne({ _id: projectId }, { ...projectObject, _id: projectId });
    return res.status(200).json({ message: 'Project updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    let projectId = req.params.id;
    if (!projectId) {
      throw new RequestError('Missing parameter');
    }
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ProjectError('This project does not exist !', 404);
    }

    await cloudinary.uploader.destroy(getPublicId(project.image_cover_large));
    await cloudinary.uploader.destroy(getPublicId(project.image_cover_small));
    await cloudinary.uploader.destroy(getPublicId(project.image_cover_medium));
    await cloudinary.uploader.destroy(getPublicId(project.image_min_large));
    await cloudinary.uploader.destroy(getPublicId(project.image_min_medium));
    await cloudinary.uploader.destroy(getPublicId(project.image_min_small));
    await Project.deleteOne({ _id: projectId });
    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

exports.getTotalLike = async (req, res, next) => {
  try {
    let projectId = req.params.id;
    if (!projectId) {
      throw new RequestError('Missing parameter');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new ProjectError('This project does not exist !', 404);
    }

    return res.status(200).json(project.like);
  } catch (error) {
    next(error);
  }
};

exports.addLike = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const updatedProject = await Project.findByIdAndUpdate(projectId, { $inc: { like: 1 } }, { new: true });
    return res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};
