import bcrypt from "bcrypt";

async function run() {
  const password = "admin123";

  const hash = await bcrypt.hash(password, 10);

  console.log("PASSWORD:", password);
  console.log("HASH:", hash);
}

run();