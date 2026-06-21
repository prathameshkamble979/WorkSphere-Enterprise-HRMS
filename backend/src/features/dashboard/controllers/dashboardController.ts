import { Request, Response } from 'express';
import { Employee } from '../../employees/models/Employee';
import { Client } from '../../clients/models/Client';
import { Approval } from '../../approvals/models/Approval';
import { Project } from '../../projects/models/Project';
import { Leave } from '../../leaves/models/Leave';
import { Notification } from '../../notifications/models/Notification';
import { logger } from '../../../config/logger';

// @desc    Get dashboard analytics statistics
// @route   GET /api/v1/dashboard/stats
// @access  Admin, Manager, HR
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalClients = await Client.countDocuments();
    
    const pendingApprovalsCount = await Approval.countDocuments({ status: 'Pending' });

    // 1. Employee Growth (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const employeeData = await Employee.find({ joiningDate: { $gte: sixMonthsAgo } }, 'joiningDate');
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months with 0
    const growthMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      growthMap.set(monthNames[d.getMonth()], 0);
    }

    // Count employees joined per month
    employeeData.forEach(emp => {
      const month = monthNames[emp.joiningDate.getMonth()];
      if (growthMap.has(month)) {
        growthMap.set(month, growthMap.get(month) + 1);
      }
    });

    // Make it cumulative (growth)
    // We should technically get total before 6 months
    const previousEmployees = await Employee.countDocuments({ joiningDate: { $lt: sixMonthsAgo } });
    let currentTotal = previousEmployees;
    
    const employeeGrowth = Array.from(growthMap.entries()).map(([month, count]) => {
      currentTotal += count;
      return { month, employees: currentTotal };
    });

    // 2. Skills Distribution (Replacing Department Distribution since we don't have departments yet)
    const allEmployees = await Employee.find({}, 'skills');
    const skillCounts: Record<string, number> = {};
    allEmployees.forEach(emp => {
      if (emp.skills && emp.skills.length > 0) {
        emp.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      } else {
        skillCounts['Unspecified'] = (skillCounts['Unspecified'] || 0) + 1;
      }
    });

    // Take top 5 skills
    const departmentDistribution = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    if (departmentDistribution.length === 0) {
      departmentDistribution.push({ name: 'No Data', value: 1 });
    }

    const approvalStats = [
      { name: 'Pending', value: pendingApprovalsCount },
      { name: 'Approved', value: await Approval.countDocuments({ status: 'Approved' }) },
      { name: 'Rejected', value: await Approval.countDocuments({ status: 'Rejected' }) },
    ];

    // 3. Recent Activities
    const recentNotifs = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(3);

    const recentActivities = recentNotifs.map((notif, idx) => {
      const diffMs = Date.now() - new Date(notif.createdAt).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffDays = Math.floor(diffHrs / 24);
      
      let timeStr = 'Just now';
      if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      else if (diffHrs > 0) timeStr = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

      return {
        id: notif._id.toString(),
        text: notif.message,
        time: timeStr
      };
    });

    // Fallback if no activities
    if (recentActivities.length === 0) {
      recentActivities.push({ id: '1', text: 'System initialized', time: 'Just now' });
    }

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalClients,
        pendingApprovalsCount,
        employeeGrowth,
        departmentDistribution,
        approvalStats,
        recentActivities
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch dashboard stats' } });
  }
};

// @desc    Get employee specific dashboard stats
// @route   GET /api/v1/dashboard/employee-stats
// @access  Authenticated Employee
export const getEmployeeDashboardStats = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({ userId: (req as any).user._id });
    if (!employee) {
      return res.status(404).json({ success: false, error: { message: 'Employee profile not found' } });
    }

    // Active Projects
    const activeProjectsCount = await Project.countDocuments({
      status: 'In Progress',
      teamMembers: employee._id
    });

    // Upcoming Time Off (Approved, Start Date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingLeaves = await Leave.find({
      employeeId: employee._id,
      status: 'Approved',
      startDate: { $gte: today }
    });

    let upcomingDays = 0;
    upcomingLeaves.forEach(leave => {
      if (leave.duration && leave.duration !== 'Full Day') {
        upcomingDays += 0.5;
      } else {
        const diffTime = Math.abs(leave.endDate.getTime() - leave.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        upcomingDays += diffDays;
      }
    });

    // Pending Leaves
    const pendingLeavesCount = await Leave.countDocuments({
      employeeId: employee._id,
      status: 'Pending'
    });

    // Recent Activities (Mix of recent leaves)
    const recentLeaves = await Leave.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentActivities = recentLeaves.map(leave => {
      let text = '';
      if (leave.status === 'Approved') text = `Your ${leave.leaveType.toLowerCase()} leave request was approved.`;
      else if (leave.status === 'Rejected') text = `Your ${leave.leaveType.toLowerCase()} leave request was rejected.`;
      else text = `You submitted a ${leave.leaveType.toLowerCase()} leave request.`;
      
      const leaveDoc = leave as any;
      return {
        id: leave._id,
        text,
        time: new Date(leaveDoc.updatedAt || leaveDoc.createdAt).toLocaleDateString()
      };
    });

    res.status(200).json({
      success: true,
      data: {
        activeProjects: activeProjectsCount,
        upcomingTimeOffDays: upcomingDays,
        pendingLeaves: pendingLeavesCount,
        recentActivities
      }
    });
  } catch (error) {
    logger.error('Error fetching employee dashboard stats:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch employee dashboard stats' } });
  }
};
