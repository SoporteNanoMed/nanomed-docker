const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "Users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 50,
      default: "user",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    emailVerified: {
      type: "boolean",
      default: false,
    },
    verificationToken: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    resetPasswordToken: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    resetPasswordExpires: {
      type: "datetime",
      nullable: true,
    },
    lastLogin: {
      type: "datetime",
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
    appointments: {
      type: "one-to-many",
      target: "Appointment",
      inverseSide: "user",
    },
    doctorAppointments: {
      type: "one-to-many",
      target: "Appointment",
      inverseSide: "doctor",
    },
  },
});

module.exports = User;
