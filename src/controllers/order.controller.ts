import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { splitOrder } from "../services/order-splitter.service";
import { orderStore } from "../store/order.store";
import { parseJsonBody } from "../validators/order.validator";
import { HTTP_STATUS } from "../constants/status-codes";

export function createOrder(req: Request, res: Response): void {
  const request = parseJsonBody(req.body);
  const order = orderStore.add(splitOrder(request));
  res.success(order, HTTP_STATUS.CREATED);
}

export function getOrders(_req: Request, res: Response): void {
  res.success({ data: orderStore.all() });
}

export function getOrder(req: Request, res: Response): void {
  const orderId = req.params.id;
  if (typeof orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid order id");
  }
  const order = orderStore.all().find((item) => item.id === orderId);
  if (!order) throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found");
  res.success(order);
}
