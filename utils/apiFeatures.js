// The class is used to filter, sort, limit fields and paginate the query object
// this.queryBuilder is the query object from mongodb
// this.queryParams is the query object from req.query in express
// in every method, this.query is updated with the new query object
// as we are returning this, we can chain the methods

class APIFeatures {
  constructor(queryBuilder, queryParams) {
    this.queryBuilder = queryBuilder;
    this.queryParams = queryParams;
  }

  filter() {
    const queryObj = { ...this.queryParams };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);

    this.queryBuilder = this.queryBuilder.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this.queryBuilder = this.queryBuilder.sort(sortBy);
    } else {
      this.queryBuilder = this.queryBuilder.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ');
      this.queryBuilder = this.queryBuilder.select(fields);
    } else {
      this.queryBuilder = this.queryBuilder.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = +this.queryParams.page || 1;
    const limit = +this.queryParams.limit || 100;
    const skip = (page - 1) * limit;

    this.queryBuilder = this.queryBuilder.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
