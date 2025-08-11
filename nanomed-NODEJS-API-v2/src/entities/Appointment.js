const { EntitySchema } = require("typeorm");

const Appointment = new EntitySchema({
  name: "Appointment",
  tableName: "CitasMedicas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    userId: {
      type: "int",
      nullable: false,
    },
    doctorId: {
      type: "int",
      nullable: false,
    },
    date: {
      type: "datetime",
      nullable: false,
    },
    status: {
      type: "varchar",
      length: 50,
      default: "pendiente",
    },
    type: {
      type: "varchar",
      length: 50,
      default: "consulta",
    },
    notes: {
      type: "text",
      nullable: true,
    },
    symptoms: {
      type: "text",
      nullable: true,
    },
    diagnosis: {
      type: "text",
      nullable: true,
    },
    prescription: {
      type: "text",
      nullable: true,
    },
    paymentStatus: {
      type: "varchar",
      length: 50,
      default: "pendiente",
    },
    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    createdAt: {
      type: "datetime",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "datetime",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
      },
    },
    doctor: {
      type: "many-to-one",
      target: "Doctor",
      joinColumn: {
        name: "doctorId",
      },
    },
  },
});

module.exports = Appointment;
