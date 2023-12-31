import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateOrderPaymentInput {
  tracking_number: string;
  payment_gateway: string;
}
