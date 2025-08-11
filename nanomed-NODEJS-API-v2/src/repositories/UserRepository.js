const BaseRepository = require("../db/repository");
const User = require("../entities/User");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByEmailWithRelations(email) {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { email },
      relations: ["appointments", "doctorAppointments"],
    });
  }

  async findByIdWithRelations(id) {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { id },
      relations: ["appointments", "doctorAppointments"],
    });
  }

  async findDoctors() {
    const repository = await this.getRepository();
    return await repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.doctor", "doctor")
      .where("user.role = :role", { role: "doctor" })
      .getMany();
  }

  async findPatients() {
    const repository = await this.getRepository();
    return await repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.appointments", "appointments")
      .where("user.role = :role", { role: "user" })
      .getMany();
  }

  async updateLastLogin(id) {
    return await this.update(id, { lastLogin: new Date() });
  }

  async verifyEmail(token) {
    const user = await this.findOne({ verificationToken: token });
    if (user) {
      await this.update(user.id, {
        emailVerified: true,
        verificationToken: null,
      });
      return true;
    }
    return false;
  }

  async setResetPasswordToken(email, token, expires) {
    return await this.update(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      }
    );
  }

  async resetPassword(token, newPassword) {
    const user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (user) {
      await this.update(user.id, {
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      return true;
    }
    return false;
  }
}

module.exports = UserRepository;
