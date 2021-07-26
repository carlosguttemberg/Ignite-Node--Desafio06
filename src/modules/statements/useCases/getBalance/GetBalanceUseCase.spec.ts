import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase;
let createStatement: CreateStatementUseCase;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatement = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementRepository, inMemoryUsersRepository);
  });

  it("should be able to get balance", async () => {
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
      await createStatement.execute({ user_id: userCreated.id as string, amount: 10,description: "teste", type: "deposit" as OperationType })
      await createStatement.execute({ user_id: userCreated.id as string, amount: 5,description: "teste", type: "withdraw" as OperationType })

      const balance = await getBalanceUseCase.execute({user_id: userCreated.id as string});

      expect(balance.statement.length).toBe(2);
    }
  });
});
