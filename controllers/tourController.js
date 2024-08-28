const Tour = require('./../models/tourModel');
const controllerFactory = require('../utils/controllerFactory');

exports.getAllTours = controllerFactory.getAll(Tour);

exports.getTour = controllerFactory.getOne(Tour, { path: 'reviews' });

exports.createTour = controllerFactory.createOne(Tour);

exports.updateTour = controllerFactory.updateOne(Tour);

exports.deleteTour = controllerFactory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          $expr: {
            $eq: [{ $year: '$startDates' }, year]
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: {
          month: '$_id',
          numTourStarts: { $size: '$tours' }
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numTourStarts: -1,
          month: 1
        }
      },
      {
        $limit: 12 // not useful here, just for the sake of demonstration
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    return next(err);
  }
};
