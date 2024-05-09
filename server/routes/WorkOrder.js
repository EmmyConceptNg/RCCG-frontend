import express from 'express';
import {
  getWorkOrder,
  getWorkOrderAppfolio,
  getHCPJobs,
  createHCPJobs,
  getHCPClients,
} from "../controllers/WorkOrderController.js";

const router = express.Router();

router.get('/', getWorkOrder);
router.get('/appfolio', getWorkOrderAppfolio);

router.get("/hcp", getHCPJobs);
router.get("/hcp/create", createHCPJobs);
router.get("/hcp/customers", getHCPClients);

// Add more routes as needed

export default router;
