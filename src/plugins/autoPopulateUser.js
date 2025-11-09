
export const autoPopulateUser = (schema) => {
  function autopopulate(next) {
    this.populate("user", "id name email");
    next();
  }

  schema.pre("find", autopopulate);
  schema.pre("findOne", autopopulate);
  schema.pre("findOneAndUpdate", autopopulate);
};
