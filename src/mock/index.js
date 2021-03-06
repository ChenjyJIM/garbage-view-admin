import Mock from 'mockjs'
import { login, logout, getUserInfo, getUserMenus } from './login'
import { getTableData, getDragList } from './data'

// 登录相关和获取用户信息
// Mock.mock(/\/login/, login)
// Mock.mock(/\/get_info/, getUserInfo)
Mock.mock(/\/logout/, logout)
Mock.mock(/\/get_table_data/, getTableData)
Mock.mock(/\/get_drag_list/, getDragList)
Mock.mock(/\/save_error_logger/, 'success')
// Mock.mock(/\/menu\/nav/, getUserMenus)

export default Mock
