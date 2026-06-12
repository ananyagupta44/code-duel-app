const getAvatar = (user) => {
  if (user.avatar) {
    return user.avatar;
  }

  return `https://robohash.org/${user.username}?size=200x200`;
};

export default getAvatar;
