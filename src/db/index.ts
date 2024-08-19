import mongoose from 'mongoose';

const dbUri = 'mongodb://localhost:27017/sol-transaction';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUri, {
      retryWrites: true, 
      w: 'majority',
    });
    mongoose.set
  } catch (err) {
    console.error(`==> ${new Date().toLocaleString()}`)
    console.error(err)
  }
};

export default connectDB;