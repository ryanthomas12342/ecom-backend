class whereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    let stringCopyQ = JSON.stringify(copyQ);

    stringCopyQ = stringCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => "$${m}");

    const jsonofCOpyQ = JSON.parse(stringCopyQ);

    this.base = this.base.find(jsonofCOpyQ);
    return this;
  }

  pager(resultperpage) {
    let currentPage = 1;

    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    const skipVal = resultperpage * (currentPage - 1);
    this.base = this.base.limit(resultperpage).skip(skipVal);
    return this;
  }
}

module.exports = whereClause;
