import connection from "../connection.js"
import { verifyToken, set_dob_and_gender,getUser } from "../users/models.js";
import { createPatient, getPatientByUserId } from "./models.js";
import { getDoctorsByPatientId } from '../practisioner/models.js'

export const handlePatient = async (req, res) =>{
      await connection.connect();

    const patientData = req.body.data
    const action = req.body.action

    let user;
   try {
     user = await verifyToken(connection, req.body.usertoken);
     } catch (error) {
     return res.status(401).json({ message: error.message });
   }

   patientData.user_id = user.id;

   
       if (action == 'create'){
           // Create a new patient record
           
           await set_dob_and_gender(connection, user.id, 
            patientData.date_of_birth, patientData.gender);
            delete patientData.date_of_birth;
            delete patientData.gender;
            await createPatient(connection,patientData);

           const patient = await getPatientByUserId(connection,user.id);
           let [userData] = await getUser(connection, 'id', user.id);
           const doctors = await getDoctorsByPatientId(connection,patient.id)

           userData = {...patient, ...userData }
           delete userData['user_id']

            return res.status(200).json({user: userData, doctors  });
            }
       else if(action == 'update'){
           // Update an existing patient record
            }
       else if(action == 'delete'){
           // Delete a patient record
           }
       else{
           return res.status(400).json({ message: "Invalid action" });
            }


//    patientData.user_id = user.id;




}