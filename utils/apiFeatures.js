
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // 1) Filtration
  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Apply filtering using [gt, gte, lt, lte]
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // 3) Sorting
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort;

      if (Array.isArray(sortBy)) {
        sortBy = sortBy.pop();
      }
      let finalSortBy = sortBy.split(",").join(" ");
      this.query = this.query.sort(finalSortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // 4) Field Limiting
  limitFields() {
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 5) Search
  search() {
    if (this.queryStr.keyword) {
      let keyword = {};
      keyword.$or = [
        { name: { $regex: this.queryStr.keyword, $options: "i" } },
        { description: { $regex: this.queryStr.keyword, $options: "i" } },
      ];
      this.query = this.query.find(keyword);
    }
    return this;
  }

  // 2) Pagination
  paginate(totalDocs) {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const endIdx = page * limit;

    // Paginate Information
    const paginate = {};
    paginate.page = page;
    paginate.limit = limit;
    paginate.numOfPages = Math.ceil(totalDocs / limit);
    if (endIdx < totalDocs) {
      paginate.next = page + 1;
    }

    if (skip > 0) {
      paginate.previous = page - 1;
    }

    this.query = this.query.skip(skip).limit(limit);
    this.paginateResult = paginate;
    return this;
  }
}

module.exports = ApiFeatures;
