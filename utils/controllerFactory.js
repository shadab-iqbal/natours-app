const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');

exports.getAll = Model => {
  const { modelName } = Model;

  return async (req, res, next) => {
    try {
      // EXECUTE QUERY
      const completeQuery = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const queryResult = await completeQuery.queryBuilder;
      // const queryResult = await completeQuery.queryBuilder.explain();

      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: queryResult.length,
        data: {
          [modelName]: queryResult
        }
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.getOne = (Model, populateOptions) => {
  const { modelName } = Model;

  return async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);

      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const doc = await query;

      if (!doc) {
        return next(new AppError(`No ${modelName} found with that ID`, 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          [modelName]: doc
        }
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.createOne = Model => {
  const { modelName } = Model;

  return async (req, res, next) => {
    try {
      const newDoc = await Model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          [modelName]: newDoc
        }
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.updateOne = Model => {
  const { modelName } = Model;

  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!doc) {
        return next(new AppError(`No ${modelName} found with that ID`, 404));
      }

      res.status(200).json({
        status: 'success',
        data: { [modelName]: doc }
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.deleteOne = Model => {
  const { modelName } = Model;

  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError(`No ${modelName} found with that ID`, 404));
      }

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      return next(err);
    }
  };
};
