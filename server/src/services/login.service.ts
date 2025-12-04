export class LoginService {
  async validateUser(username: string, password: string) {
    // TODO: Replace with real DB
    if (username === "admin" && password === "password") {
      return {
        subject: "admin",
        name: "Administrator"
      };
    }

    return null;
  }
}
