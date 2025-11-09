export const toJSONPlugin = (schema) => {
    schema.set("toJSON", {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.otpCodeExpires
        delete ret.otpCode
      },
    });
  };
  