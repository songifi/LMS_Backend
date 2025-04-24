// import { Test, TestingModule } from '@nestjs/testing';
// import { MailService } from './mail.service';
// import { ConfigService } from '@nestjs/config';

// describe('MailService', () => {
//   let service: MailService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         MailService,
//         {
//           provide: ConfigService,
//           useValue: {
//             get: jest.fn(), // mock any specific get('key') if needed
//           },
//         },
//         {
//           provide: 'RepositoryToken',
//           useValue: {
//             // mock repository methods as needed
//             save: jest.fn(),
//             findOne: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<MailService>(MailService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
