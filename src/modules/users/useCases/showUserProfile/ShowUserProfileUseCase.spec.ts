import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to get user profile", async () => {
    const user = {
      name: "Test User",
      email: "test@test.com",
      password: "123"
    }

    await createUserUseCase.execute(user);

    const userCreated = await inMemoryUsersRepository.findByEmail(
      user.email
    );

    if(userCreated){
      const userProfile = await showUserProfileUseCase.execute(userCreated.id as string);

      expect(userProfile).toHaveProperty("id");
      expect(userProfile).toHaveProperty("name");
      expect(userProfile).toHaveProperty("email");
      expect(userProfile).toHaveProperty("password");
    }
  });
});
