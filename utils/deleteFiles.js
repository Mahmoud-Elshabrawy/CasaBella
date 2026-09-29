const fs = require("fs/promises");
const path = require("path");

exports.deleteFiles = async (folder, files = []) => {
  if (!files || (Array.isArray(files) && files.length === 0)) return;

  const fileList = Array.isArray(files) ? files : [files];

  await Promise.all(
    fileList.map((file) =>
      fs
        .unlink(path.join(process.cwd(), "uploads", folder, file))
        .catch((err) => {
          console.log(err);
        }),
    ),
  );
};

