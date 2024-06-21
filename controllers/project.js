const fs = require('fs');
const { RequestError, ProjectError } = require('../errors/customError');
const Project = require('../models/project');
const cloudinary = require('../cloudinaryConfig');

const getPublicId = (imageUrl) => imageUrl.split('/').pop().split('.')[0];

exports.getAllProjectImages = async (req, res, next) => {
  try {
    Project.find()
      .select('image_cover')
      .then((projects) => {
        res.json({ data: projects });
      })
      .catch((error) => next(error));
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
    const resultCover = await uploaderCoverImg(img, req.file.path);
    const resultMin = await uploaderMinImg(img, req.file.path);
    delete projectObject._id;
    const newProject = new Project({
      ...projectObject,
      image_cover: `${resultCover}`,
      image_min: `${resultMin}`,
    });

    await newProject.save();

    return res.status(201).json({ message: `The project ${title} created` });
  } catch (error) {
    next(error);
  }
};

const uploaderCoverImg = async (imgName, path) => {
  const coverImg = `couverture_${imgName}`;
  const resultCover = await cloudinary.uploader.upload(path, {
    resource_type: 'image',
    public_id: coverImg,
  });
  return resultCover.secure_url;
};

const uploaderMinImg = async (imgName, path) => {
  const minImg = `miniature_${imgName}`;
  const resultMin = await cloudinary.uploader.upload(path, {
    resource_type: 'image',
    public_id: minImg,
    transformation: [{ x: 50, width: 400, height: 400, crop: 'crop', gravity: 'north_west' }],
  });
  return resultMin.secure_url;
};

const buildImgUrl = (projectTitle) => {
  return `${projectTitle.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
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

    if (req.file) {
      const img = buildImgUrl(project.title);
      const resultCover = await uploaderCoverImg(img, req.file.path);
      const resultMin = await uploaderMinImg(img, req.file.path);

      projectObject = {
        ...JSON.parse(req.body.project),
        image_cover: `${resultCover}`,
        image_min: `${resultMin}`,
      };
    } else {
      projectObject = { ...JSON.parse(req.body.project) };
    }

    await Project.updateOne({ _id: projectId }, { ...projectObject, _id: projectId });

    if (req.file) {
      await cloudinary.uploader.destroy(getPublicId(project.image_cover));
      await cloudinary.uploader.destroy(getPublicId(project.image_min));
    }
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

    await cloudinary.uploader.destroy(getPublicId(project.image_cover));
    await cloudinary.uploader.destroy(getPublicId(project.image_min));
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
