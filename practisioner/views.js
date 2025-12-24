import { set_dob_abt_and_gender,getUser ,verifyToken} from '../users/models.js'
import { getPatientsByDoctorId,createDoctor,getDoctorsByUserId } from './models.js'
import connection from "../connection.js";
import { saveFile } from '../file.js';


//to be removed later 
export const get_all_doctors = async (req,res)=>{
  const doctor = await connection.query(`SELECT doctor.*, users.*
                                          FROM doctor
                                          JOIN users ON users.id = doctor.user_id`)
  return res.status(200).json(doctor.rows)
  }

export const handlePractitioner = async (req,res) =>{
    await connection.connect();
    const { action: rawAction, ...doctorData } = req.body
    // const action = req.body.action
    const action = (rawAction || '').toString().toLowerCase().trim();
    if (!action) {
        return res.status(400).json({ message: "Action is required" });
    }
    let user;
   try {
     user = await verifyToken(connection, req.headers.authorization);
     } catch (error) {
     return res.status(401).json({ message: error.message });
   }

   doctorData.user_id = user.id;

   switch(action) {
    
       case 'create':
            await set_dob_abt_and_gender(connection, user.id, 
            doctorData.date_of_birth, doctorData.gender,
            doctorData.about_me);

            delete doctorData.date_of_birth;
            delete doctorData.gender;
            delete doctorData.about_me;

           let doctor = await getDoctorsByUserId(connection,user.id);
           if(!doctor){
            doctor = await createDoctor(connection, doctorData);
           }

          //  handle images upload
          for(const [key, value] of Object.entries(req.files)){
            if(value[0] && value[0].filename){
            let id = key == 'license_image'?doctor.id:user.id
              saveFile(key,value[0].filename,id,connection)
          }
            }

           let [userData] = await getUser(connection, 'id', user.id);
           const patients = await getPatientsByDoctorId(connection,doctor.id)
            
           userData = {...doctor, ...userData }
           delete userData['user_id']

            return res.status(200).json({ user:userData, patients });

       case 'update':
            await set_dob_abt_and_gender(connection, user.id, 
            doctorData.date_of_birth, doctorData.gender,
            doctorData.about_me);

            delete doctorData.date_of_birth;
            delete doctorData.gender;
            delete doctorData.about_me;

           let doctor_ = await updateDoctor(connection, doctorData);
            //  handle images upload
          for(const [key, value] of Object.entries(req.files)){
            if(value[0] && value[0].filename){
              let id = doctor_.id?key == 'license_image':user.id
              saveFile(key,value[0].filename,id,connection)
          }
            }
           return res.status(200).json({ message: "Doctor updated successfully" });
       case 'delete':
           await deleteDoctor(connection, doctorData.id);
           return res.status(200).json({ message: "Doctor deleted successfully" });
       default:
           return res.status(400).json({ message: "Invalid action" });
   }

}


// export const handlefiles = async (req,res) =>{
//     console.log(req.files.gallery[0].filename)
//   console.log(req.files.avatar[0].filename)
//     // console.log(req.files)

//       return res.status(200).json({avatar:req.files.avatar.filename,
//         gallery:req.files.gallery.filename });

// }
