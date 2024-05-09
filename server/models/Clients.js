import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    clients: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Clients = mongoose.model("Clients", schema);

export default Clients;
