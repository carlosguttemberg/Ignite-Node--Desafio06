import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createStatement: CreateStatementUseCase;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatement = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
  });

  it("should be able to get statement", async () => {
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
      await createStatement.execute({ user_id: userCreated.id as string, amount: 5,description: "teste", type: "withdraw" as OperationType })

      const statement = await getStatementOperationUseCase.execute({ user_id: userCreated.id as string, statement_id: deposit.id as string});

      expect(statement).toHaveProperty("id");
      expect(statement.id).toBe(deposit.id);
      expect(statement.type).toBe("deposit");
      expect(statement.amount).toBe(10);
      expect(statement.user_id).toBe(userCreated.id);
    }
  });
});
