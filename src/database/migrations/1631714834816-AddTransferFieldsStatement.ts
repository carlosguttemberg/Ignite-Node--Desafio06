import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddTransferFieldsStatement1631714834816 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn('statements', new TableColumn({
        name: "sender_id",
        type: 'uuid',
        isNullable: true,
      }));

      await queryRunner.createForeignKey(
          'statements',
          new TableForeignKey({
            name: 'SenderUser',
            columnNames: ['sender_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users'
          }) );

      await queryRunner.addColumn('statements', new TableColumn({
        name: "receiver_id",
        type: 'uuid',
        isNullable: true,
      }));

      await queryRunner.createForeignKey(
          'statements',
          new TableForeignKey({
            name: 'ReceiverUser',
            columnNames: ['receiver_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users'
          }) );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'SenderUser');

      await queryRunner.dropForeignKey('statements', 'ReceiverUser');

      await queryRunner.dropColumn('statements', 'receiver_id');

      await queryRunner.dropColumn('statements', 'sender_id');
    }

}
