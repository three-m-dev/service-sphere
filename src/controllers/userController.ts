import { Request, Response } from "express";
import { UserParams, UserService } from "../services/userService";
import { ExtendedRequest } from "../middleware/authMiddleware";

export class UserController {
  public static async createUser(req: ExtendedRequest, res: Response) {
    try {
      const user = req.user;

      const newUser = await UserService.createUser(user.userId, req.body);
      res.status(201).json(newUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  }

  public static async authUser(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const authResponse = await UserService.authUser(username, password);
      res.status(200).json(authResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  }

  public static async getUsers(req: Request, res: Response) {
    try {
      const queryParams: UserParams = {};
      const allowedFilters = ["accountType", "isActive"];
      allowedFilters.forEach((filter) => {
        if (req.query[filter]) {
          queryParams[filter as keyof UserParams] = req.query[filter] as string;
        }
      });

      const users = await UserService.getUsers(queryParams);
      res.status(200).json(users);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  }

  public static async getUserById(req: Request, res: Response) {
    try {
      const userId: string = req.params.userId;

      const user = await UserService.getUserById(userId);

      res.status(200).json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  }
}
