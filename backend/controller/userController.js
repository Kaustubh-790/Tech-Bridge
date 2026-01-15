import User from "../models/user.js";

export const syncUser = async (req, res) => {
  const { uid, name, email, picture } = req.user;

  try {
    let user = await User.findById(uid);

    if (!user) {
      user = new User({
        _id: uid,
        name: name || "User",
        email: email,
        picture: picture,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
