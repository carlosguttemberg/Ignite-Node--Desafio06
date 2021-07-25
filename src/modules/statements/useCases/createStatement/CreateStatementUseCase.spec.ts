import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createStatement: CreateStatementUseCase;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatement = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
  });

  it("should be able to create statement", async () => {
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
      const deposit = await createStatement.execute({ user_id: userCreated.id as string, amount: 10,description: "teste", type: "deposit" as OperationType })
      const withdraw = await createStatement.execute({ user_id: userCreated.id as string, amount: 5,description: "teste", type: "withdraw" as OperationType })

      expect(deposit).toHaveProperty("id");
      expect(deposit.type).toBe("deposit");
      expect(deposit.amount).toBe(10);
      expect(deposit.user_id).toBe(userCreated.id);

      expect(withdraw).toHaveProperty("id");
      expect(withdraw.type).toBe("withdraw");
      expect(withdraw.amount).toBe(5);
      expect(withdraw.user_id).toBe(userCreated.id);

    }
  });
});
