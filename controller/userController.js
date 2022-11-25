import userModel from "../model/userModel.js";

class UserController {
  static create(data) {
    return userModel.create(data)
  }

  static get(query = {}) {
    return userModel.find(query)
  }

  static getByid(id) {
    return userModel.findById(id)
  }

  static uploadById(id, data) {
    return userModel.updateOne({ _id: id }, { $set: data })
  }

  static deleteById(id) {
    return userModel.deleteOne({ _id: id })
  }
}

export default UserController;