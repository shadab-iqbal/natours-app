/* eslint-disable no-restricted-globals */
const Tour = require('./../models/tourModel');
const controllerFactory = require('../utils/controllerFactory');
const AppError = require('./../utils/appError');

exports.getAllTours = controllerFactory.getAll(Tour);

exports.getTour = controllerFactory.getOne(Tour, { path: 'reviews' });

exports.createTour = controllerFactory.createOne(Tour);

exports.updateTour = controllerFactory.updateOne(Tour);

exports.deleteTour = controllerFactory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  return next();
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

exports.getNearbyTours = async (req, res, next) => {
  const { latlng, distance } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format => lat,lng',
        400
      )
    );
  }

  // Error if distance cannot be parsed as a number,
  // or if distance is not a finite number (e.g., Infinity, -Infinity, or NaN).
  if (isNaN(parseFloat(distance)) || !isFinite(distance)) {
    return next(new AppError('Please provide a valid distance in km!', 400));
  }

  try {
    // converting km to radian bc "geoWithin" query takes radian unit
    const radius = distance / 6378.1;

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius]
        }
      }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getTourDistances = async (req, res, next) => {
  const { latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format => lat,lng',
        400
      )
    );
  }

  try {
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          // the point from which to calculate distances
          near: {
            type: 'Point',
            coordinates: [+lng, +lat]
          },
          distanceField: 'distance', // field to add the calculated distance
          distanceMultiplier: 0.001 // converting meters to km
        }
      },
      // we only want the name and distance fields
      {
        $project: {
          name: 1,
          distance: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        distances
      }
    });
  } catch (err) {
    return next(err);
  }
};
