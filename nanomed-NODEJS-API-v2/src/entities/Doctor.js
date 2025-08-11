const { EntitySchema } = require("typeorm");

const Doctor = new EntitySchema({
  name: "Doctor",
  tableName: "Doctores",
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
    specialty: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    license: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    experience: {
      type: "int",
      nullable: true,
    },
    bio: {
      type: "text",
      nullable: true,
    },
    isAvailable: {
      type: "boolean",
      default: true,
    },
    rating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      default: 0,
    },
    totalAppointments: {
      type: "int",
      default: 0,
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
    appointments: {
      type: "one-to-many",
      target: "Appointment",
      inverseSide: "doctor",
    },
  },
});

module.exports = Doctor;
