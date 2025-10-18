import type { Request, Response } from 'express';
import { CompaniesService } from './service.js';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';
import { CompanyRole } from '../../generated/prisma/index.js';

const service = new CompaniesService();

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const query = CompanyQueryDto.parse(req.query);
    const result = await service.list(query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy danh sách công ty',
    });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const input = CreateCompanyDto.parse(req.body);
    const company = await service.create(input);
    res.status(201).json({
      success: true,
      data: company,
      message: 'Tạo công ty thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể tạo công ty',
    });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.getById(req.params.id);
    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy thông tin công ty',
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const input = UpdateCompanyDto.parse(req.body);
    const company = await service.update(req.params.id, input);
    res.json({
      success: true,
      data: company,
      message: 'Cập nhật công ty thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể cập nhật công ty',
    });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({
      success: true,
      message: 'Xóa công ty thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xóa công ty',
    });
  }
};

// Additional controllers
export const verifyCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.verifyCompany(req.params.id);
    res.json({
      success: true,
      data: company,
      message: 'Xác thực công ty thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xác thực công ty',
    });
  }
};

export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await service.getCompanyJobs(req.params.id, page, limit);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy danh sách việc làm',
    });
  }
};

export const getCompanyUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await service.getCompanyUsers(req.params.id, page, limit);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy danh sách thành viên',
    });
  }
};

export const assignUserToCompany = async (req: Request, res: Response) => {
  try {
    const { userId, companyRole } = req.body;
    const user = await service.assignUser(
      req.params.id,
      userId,
      companyRole || CompanyRole.VIEWER,
    );
    res.json({
      success: true,
      data: user,
      message: 'Thêm thành viên thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể thêm thành viên',
    });
  }
};

export const removeUserFromCompany = async (req: Request, res: Response) => {
  try {
    const user = await service.removeUser(req.params.id, req.params.userId);
    res.json({
      success: true,
      data: user,
      message: 'Xóa thành viên thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xóa thành viên',
    });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { companyRole } = req.body;
    if (!companyRole) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp companyRole',
      });
    }

    const user = await service.updateUserRole(req.params.id, req.params.userId, companyRole);
    res.json({
      success: true,
      data: user,
      message: 'Cập nhật vai trò thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể cập nhật vai trò',
    });
  }
};

export const activateCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.activateCompany(req.params.id);
    res.json({
      success: true,
      data: company,
      message: 'Kích hoạt công ty thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể kích hoạt công ty',
    });
  }
};

export const deactivateCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.deactivateCompany(req.params.id);
    res.json({
      success: true,
      data: company,
      message: 'Vô hiệu hóa công ty thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể vô hiệu hóa công ty',
    });
  }
};

export const unverifyCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.unverifyCompany(req.params.id);
    res.json({
      success: true,
      data: company,
      message: 'Hủy xác thực công ty thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể hủy xác thực công ty',
    });
  }
};

