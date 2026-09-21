const fs = require("fs/promises");
const path = require("path");

exports.deleteFiles = async (folder, files = []) => {
  await Promise.all(
    files.map((file) => {
      fs.unlink(path.join(process.cwd(), "uploads", folder, file)).catch(
        (err) => {
          console.log(err);
        },
      );
    }),
  );
};
