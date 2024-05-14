import Clients from "../models/Clients.js";
import WorkOrder from "../models/WorkOrder.js";
import axios from "axios";
import { sendMail } from "./SendMail.js";
import { Invoice } from "../pages/Invoice.js";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
dotenv.config();

// WorkOrder controller
export const getWorkOrder = async (req, res) => {
  // Handle GET request for WorkOrder
  try {
    const items = await WorkOrder.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkOrderAppfolio = async (req, res) => {
  try {
    const response = await axios.get(
      `https://${process.env.clientID}:${process.env.clientSecret}@longforddc.appfolio.com/api/v1/reports/work_order.json`
    );

    const sanitizedWorkOrders = response.data.results;

    if (!Array.isArray(sanitizedWorkOrders)) {
      throw new Error("Data is not in expected array format.");
    }

    const processedOrders = await Promise.all(
      sanitizedWorkOrders
        .filter(
          (workOrder) =>
            workOrder.Vendor === "Rock Creek Construction, LLC" &&
            workOrder.Status === "Assigned" 
            
        )
        .map(async (workOrder) => {
          const existingOrder = await WorkOrder.findOne({
            "orders.WorkOrderId": workOrder.WorkOrderId,
          });

          if (!existingOrder) {
            const getClient = await getHCPClients();

            

           const longFord = getClient.customers.find(
             (client) =>
               client.first_name === "Longford" &&
               client.last_name === "Management"
           );

          //  return res.status(200).json(longFord);

           const cleanedLongFord = removeCircularReferences(longFord);
          //  return res.json(getClient);

            const createdJob = await createHCPJobs(workOrder, longFord);

            await sendMail(
              process.env.INVOICE_MAIL,
              `Invoice ${createdJob.invoice_number}`,
              Invoice(createdJob)
            );

            const filter = { "orders.WorkOrderId": workOrder.WorkOrderId };
            const update = { orders: workOrder };
            const options = { new: true, upsert: true };

            const updatedOrder = await WorkOrder.findOneAndReplace(
              filter,
              update,
              options
            );

            return updatedOrder;
          } else {
            console.log(
              `>>>>>>> Skipping >>>>>>> Work order ${workOrder.WorkOrderId} already exists in the database.`
            );
            logger.info(
              `>>>>>>> Skipping >>>>>>> Work order ${workOrder.WorkOrderId} already exists in the database.`
            );
            return null;
          }
        })
    );

    console.log(processedOrders.filter((order) => order !== null));
    res.status(200).json(processedOrders.filter((order) => order !== null));
    // return processedOrders.filter((order) => order !== null);
  } catch (error) {
    console.error("Failed to get or create work orders:", error);
    logger.error("Failed to get or create work orders:", error);
    // res
    //   .status(500)
    //   .json({ error: "An error occurred while processing your request." });
    console.log({ error: "An error occurred while processing your request." });
    logger.error({ error: "An error occurred while processing your request." });
  }
};

export const getHCPClients = async () => {
  const options = {
    method: "GET",
    url: "https://api.housecallpro.com/customers",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${process.env.HCPAPI}`,
    },
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};
export const getHCPJobs = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://api.housecallpro.com/jobs",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${process.env.HCPAPI}`,
    },
  };

  try {
    const { data } = await axios.request(options);
    console.log(data);
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

export const createHCPJobs = async (workOrder, client) => {
  console.log('client', client)
  // console.log('work order', workOrder)
  try {
    const { data } = await axios.post(
      "https://api.housecallpro.com/jobs",
      {
        customer_id: client.id,
        address_id: client.addresses[0].id,
        // schedule: {
        //   scheduled_start: workOrder.orders.ScheduledStart ?? '2023-03-23',
        //   scheduled_end: workOrder.orders.ScheduledEnd ?? '2023-03-23',
        //   arrival_window: 0,
        // },
        // assigned_employee_ids: ["string"],
        line_items: [
          {
            name: workOrder.WorkOrderNumber + " - " + workOrder.JobDescription,
            description: workOrder.JobDescription,
            unit_price: workOrder.Amount * 100,
            quantity: 1,
            unit_cost: workOrder.Amount * 100,
          },
        ],
        // tags: ["string"],
        lead_source: "Appfolio",
        notes: workOrder.Instructions ?? "",
        // job_fields: {
        //   job_type_id: "string",
        //   business_unit_id: "string",
        // },
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Token ${process.env.HCPAPI}`,
        },
      }
    );
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

const createCustomer = async (workOrder) => {
  let tenantFirstName = "";
  let tenantLastName = "";

  // console.log(workOrder)

  if (workOrder.PrimaryTenant) {
    const [firstName, lastName] = workOrder.PrimaryTenant.split(" ").map(
      (part) => part.trim()
    );

    tenantFirstName = firstName;
    tenantLastName = lastName;
  }

  // console.log('first_name', tenantFirstName);

  try {
    const existingClient = await Clients.findOne({
      "clients.first_name": tenantFirstName,
      "clients.last_name": tenantLastName,
    });

    // If client does not exist, create one
    if (!existingClient) {
      console.log(`>>>>>>>>>>>>>>>>>>>>>>Creating Customer >>>>>>>>>>>>>>>>`);
      console.log(`>>>>>>>>>>>>>>>>>>>>>>Creating Customer >>>>>>>>>>>>>>>>`);
      console.log(`>>>>>>>>>>>>>>>>>>>>>>Creating Customer >>>>>>>>>>>>>>>>`);
      logger.info(`>>>>>>>>>>>>>>>>>>>>>>Creating Customer >>>>>>>>>>>>>>>>`);

      const createCustomerResponse = await axios.post(
        "https://api.housecallpro.com/customers",
        {
          first_name: tenantFirstName,
          last_name: tenantLastName,
          email: workOrder.PrimaryTenantEmail,
          company: workOrder.Vendor,
          notifications_enabled: true,
          mobile_number: (workOrder.PrimaryTenantPhoneNumber =
            workOrder.PrimaryTenantPhoneNumber.replace("Phone: ", "")),
          lead_source: "Appfolio",
          addresses: [
            {
              street: workOrder.PropertyStreet1,
              street_line_2: workOrder.PropertyStreet2,
              city: workOrder.PropertyCity,
              state: workOrder.PropertyState,
              zip: workOrder.PropertyZip,
              // country: "USA",
            },
          ],
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Token ${process.env.HCPAPI}`,
          },
        }
      );

      console.log("created customer", createCustomerResponse.data);
      logger.info("created customer");

      // Save customer data to your MongoDB collection
      await Clients.create({ clients: createCustomerResponse.data });

      return { clients: createCustomerResponse.data };
    } else {
      // If client already exists, return existing client data
      return existingClient;
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

// Function to remove circular references from an object
function removeCircularReferences(obj) {
  const seen = new WeakSet();
  function replacer(key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  }
  return JSON.parse(JSON.stringify(obj, replacer));
}

getWorkOrderAppfolio();
