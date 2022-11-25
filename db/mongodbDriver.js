import mongoose from 'mongoose'

const init = async () => {
  try {
    const URL = process.env.MONGO_URL_PASSPORT || 'mongodb://localhost:27017/ecommerce'
    await mongoose.connect(URL)
    console.log('Database mongo atlas connected.')
  } catch (error) {
    console.error('Error to connecto to database', error.message)
  }
}

export default init