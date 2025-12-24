import multer from 'multer'
import { fileURLToPath } from 'url';
import path from 'path';
const fs = await import('fs');



// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, path.join(__dirname, 'statics/uploads/'))
  },
  filename: function (req, file, cb) {
  
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })
export const uploadMiddleware = upload.fields([{ name: 'avatar', maxCount: 1 },
     { name: 'gallery', maxCount: 1 }])

export const doctorFiles = upload.fields([{ name: 'profile_image', maxCount: 1 },
     { name: 'license_image', maxCount: 1 }])
     


export const saveFile = async (col,filename,id,connection) => {

    if(col == 'license_image'){
        // delete previous file if exists
        let old_file = await connection.query(`
        SELECT license_image FROM doctor WHERE id = $1
    `, [id]);
        if(old_file.rows[0] && old_file.rows[0].license_image){
          const oldFilePath = path.join(__dirname, 'statics/uploads/', 
            old_file.rows[0].license_image);
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });
        }

        // update doctor table
        await connection.query(`
        UPDATE doctor
        SET license_image = $1
        WHERE id = $2
    `, [filename, id]);
    }else if(col == 'profile_image'){
      // delete previous file if exists
       let old_file = await connection.query(`
        SELECT profile_image FROM users WHERE id = $1
    `, [id]);
        if(old_file.rows[0] && old_file.rows[0].profile_image){
          const oldFilePath = path.join(__dirname, 'statics/uploads/', 
            old_file.rows[0].profile_image);
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });
        }
        
      // update users table
        await connection.query(`
        UPDATE users
        SET profile_image = $1
        WHERE id = $2
    `, [filename, id]);

    }



}