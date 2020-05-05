import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import Crypt from '../classes/crypt';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import AdminGeneralModel from '../models/adminGeneral';

export default class AdminGeneralController {

}