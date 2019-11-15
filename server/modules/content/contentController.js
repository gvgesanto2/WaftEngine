const httpStatus = require('http-status');
var objectId = require('mongoose').Types.ObjectId;
const otherHelper = require('../../helper/others.helper');
const contentSch = require('./contentSchema');
const contentConfig = require('./contentConfig');
const contentController = {};
const internal = {};

contentController.GetContent = async (req, res, next) => {
  try {
    let { page, size, populate, selectq, searchq, sortq } = otherHelper.ParseFilters(req, 10, false);

    if (req.query.find_name) {
      searchq = { name: { $regex: req.query.find_name, $options: 'i' }, ...searchq };
    }
    if (req.query.find_key) {
      searchq = { key: { $regex: req.query.find_key, $options: 'i' }, ...searchq };
    }
    if (req.query.find_publish_from) {
      searchq = { publish_from: { $regex: req.query.find_publish_from, $options: 'i' }, ...searchq };
    }
    if (req.query.find_publish_to) {
      searchq = { publish_to: { $regex: req.query.find_publish_to, $options: 'i' }, ...searchq };
    }
    let datas = await otherHelper.getquerySendResponse(contentSch, page, size, sortq, searchq, selectq, next, populate);

    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, datas.data, contentConfig.gets, page, size, datas.totaldata);
  } catch (err) {
    next(err);
  }
};
contentController.SaveContent = async (req, res, next) => {
  try {
    const contents = req.body;
    if (contents && contents._id) {
      const update = await contentSch.findByIdAndUpdate(contents._id, { $set: contents }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, contentConfig.save, null);
    } else {
      contents.added_by = req.user.id;
      const newContent = new contentSch(contents);
      const contentsSave = await newContent.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, contentsSave, null, contentConfig.save, null);
    }
  } catch (err) {
    next(err);
  }
};
contentController.GetContentDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const contents = await contentSch.findOne({ _id: id, is_deleted: false });
    return otherHelper.sendResponse(res, httpStatus.OK, true, contents, null, contentConfig.get, null);
  } catch (err) {
    next(err);
  }
};
contentController.GetContentByKey = async (req, res, next) => {
  try {
    const key = req.params.key;
    const contents = await contentSch.findOne({ key, is_deleted: false });
    return otherHelper.sendResponse(res, httpStatus.OK, true, contents, null, contentConfig.get, null);
  } catch (err) {
    next(err);
  }
};
contentController.DeleteContent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const del = await contentSch.findByIdAndUpdate(id, { $set: { is_deleted: true } }, { new: true });
    return otherHelper.sendResponse(res, httpStatus.OK, true, del, null, 'content delete success!!', null);
  } catch (err) {
    next(err);
  }
};

module.exports = contentController;
