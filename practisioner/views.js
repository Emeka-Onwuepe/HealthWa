import { set_dob_abt_and_gender,getUser ,verifyToken} from '../users/models.js'
import { getPatientsByDoctorId,createDoctor } from './models.js'
import connection from "../connection.js";


export const handlePractitioner = async (req,res) =>{

    const doctorData = req.body.data
    const action = req.body.action

    let user;
   try {
     user = await verifyToken(connection, req.body.usertoken);
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

           const [doctor] = await getDoctorsByUserId(connection,user.id);
           if(!doctor){
            await createDoctor(connection, doctorData);
           }
           let [userData] = await getUser(connection, 'id', user.id);
           const patients = await getPatientsByDoctorId(connection,doctor.id)
            
           userData = {...doctor, ...userData }
           delete userData['user_id']

            return res.status(200).json({ user:userData, patients });

       case 'update':
           await updateDoctor(connection, doctorData);
           return res.status(200).json({ message: "Doctor updated successfully" });
       case 'delete':
           await deleteDoctor(connection, doctorData.id);
           return res.status(200).json({ message: "Doctor deleted successfully" });
       default:
           return res.status(400).json({ message: "Invalid action" });
   }

}