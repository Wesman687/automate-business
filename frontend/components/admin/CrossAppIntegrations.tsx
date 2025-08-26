import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Modal, Form, Input, Select, Switch, message, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, KeyOutlined } from '@ant-design/icons';
import { api } from '@/lib/https';

const { Option } = Select;
const { TextArea } = Input;

interface AppIntegration {
  id: number;
  app_id: string;
  app_name: string;
  app_domain: string;
  app_url?: string;
  description?: string;
  permissions: string[];
  is_public: boolean;
  status: 'pending_approval' | 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at?: string;
  created_by?: number;
  approved_by?: number;
  approved_at?: string;
}

interface CreateAppForm {
  app_name: string;
  app_domain: string;
  description?: string;
  is_public: boolean;
}

const CrossAppIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<AppIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    // First check if the backend is healthy
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await api.get('/admin/cross-app/health');
      console.log('Backend health:', health);
      if (health.table_exists) {
        fetchIntegrations();
      } else {
        message.error('Cross-app tables not found. Please check database setup.');
      }
    } catch (error) {
      console.error('Health check error:', error);
      message.error('Cannot connect to backend');
    }
  };

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/cross-app/integrations');
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      message.error('Error fetching integrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: CreateAppForm) => {
    try {
      const result = await api.post('/admin/cross-app/integrations', {
        app_name: values.app_name,
        app_domain: values.app_domain,
        description: values.description,
        is_public: values.is_public,
        app_url: `https://${values.app_domain}`,
        webhook_url: `https://${values.app_domain}/apphook`,
        permissions: [
          'read_user_info',
          'read_credits',
          'purchase_credits',
          'consume_credits',
          'manage_subscriptions',
          'read_analytics'
        ]
      });

      message.success('App integration created successfully!');
      message.info(`API Key: ${result.api_key} - Save this securely!`);
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      message.error('Error creating integration. Please try again.');
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedIntegration) return;
    
    try {
      await api.put(`/admin/cross-app/integrations/${selectedIntegration.app_id}`, values);
      message.success('Integration updated successfully!');
      setEditModalVisible(false);
      setSelectedIntegration(null);
      editForm.resetFields();
      fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      message.error('Error updating integration. Please try again.');
    }
  };

  const handleView = (record: AppIntegration) => {
    setSelectedIntegration(record);
    setEditModalVisible(true);
    editForm.setFieldsValue(record);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.del(`/admin/cross-app/integrations/${id}`);
      message.success('Integration deleted successfully!');
      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      message.error('Error deleting integration. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending_approval': return 'orange';
      case 'suspended': return 'red';
      case 'inactive': return 'gray';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'APP NAME',
      dataIndex: 'app_name',
      key: 'app_name',
      render: (text: string) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: 'DOMAIN',
      dataIndex: 'app_domain',
      key: 'app_domain',
      render: (text: string) => (
        <span className="text-gray-400">{text}</span>
      ),
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span className="text-gray-400 max-w-xs truncate block">
          {text || 'No description'}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending_approval: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending' },
          active: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Active' },
          inactive: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Inactive' },
          suspended: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Suspended' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
            {config.text}
          </span>
        );
      },
    },
    {
      title: 'PUBLIC',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          isPublic ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
        }`}>
          {isPublic ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'CREATED',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span className="text-gray-400">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: any, record: AppIntegration) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(record)}
            className="p-1.5 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10 rounded transition-colors"
            title="View Details"
          >
            <EyeOutlined className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(record)}
            className="p-1.5 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10 rounded transition-colors"
            title="Edit"
          >
            <EditOutlined className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
            title="Delete"
          >
            <DeleteOutlined className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="cross-app-integrations">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-300 mb-2">App Integrations</h2>
        <p className="text-gray-400">Manage your cross-app integrations and create new ones</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">Active Integrations</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            className="bg-electric-blue hover:bg-electric-blue/90 border-0 text-black font-medium hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-200"
          >
            Add New App
          </Button>
        </div>
        
        <div className="bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
          <Table
            columns={columns}
            dataSource={integrations}
            loading={loading}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              className: "text-gray-300",
              itemRender: (page, type, originalElement) => {
                if (type === 'page') {
                  return (
                    <span className="text-gray-300 hover:text-electric-blue transition-colors">
                      {page}
                    </span>
                  );
                }
                return originalElement;
              }
            }}
            className="custom-table"
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <div className="text-gray-400 mb-2">No integrations found</div>
                  <div className="text-gray-500 text-sm">Create your first app integration to get started</div>
                </div>
              )
            }}
            size="middle"
            bordered={false}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title="Create New App Integration"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
        className="dark-theme-modal"
        styles={{
          header: { backgroundColor: '#1A1A1B', borderBottom: '1px solid #2A2A2B' },
          body: { backgroundColor: '#1A1A1B' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          className="dark-form"
        >
          <Form.Item
            name="app_name"
            label={<span className="text-gray-400">App Name</span>}
            rules={[{ required: true, message: 'Please enter app name' }]}
          >
            <Input 
              placeholder="e.g., Scraper, Videos, etc." 
              className="dark-input"
            />
          </Form.Item>

          <Form.Item
            name="app_domain"
            label={<span className="text-gray-400">App Domain</span>}
            rules={[{ required: true, message: 'Please enter app domain' }]}
          >
            <Input 
              placeholder="e.g., scraper.stream-lineai.com" 
              className="dark-input"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-gray-400">Description</span>}
          >
            <TextArea 
              rows={2} 
              placeholder="Brief description of the app" 
              className="dark-textarea"
            />
          </Form.Item>

          <Form.Item
            name="is_public"
            label={<span className="text-gray-400">Public App</span>}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch className="dark-switch" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-electric-blue hover:bg-electric-blue/90 border-0 text-black font-medium hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-200"
              >
                Create Integration
              </Button>
              <Button 
                onClick={() => setCreateModalVisible(false)}
                className="border-dark-border text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit App Integration"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedIntegration(null);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
        className="dark-theme-modal"
        styles={{
          header: { backgroundColor: '#1A1A1B', borderBottom: '1px solid #2A2A2B' },
          body: { backgroundColor: '#1A1A1B' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          className="dark-form"
        >
          <Form.Item
            name="app_name"
            label={<span className="text-gray-400">App Name</span>}
            rules={[{ required: true, message: 'Please enter app name' }]}
          >
            <Input 
              placeholder="e.g., Scraper, Videos, etc." 
              className="dark-input"
            />
          </Form.Item>

          <Form.Item
            name="app_domain"
            label={<span className="text-gray-400">App Domain</span>}
            rules={[{ required: true, message: 'Please enter app domain' }]}
          >
            <Input 
              placeholder="e.g., scraper.stream-lineai.com" 
              className="dark-input"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-gray-400">Description</span>}
          >
            <TextArea 
              rows={2} 
              placeholder="Brief description of the app" 
              className="dark-textarea"
            />
          </Form.Item>

          <Form.Item
            name="is_public"
            label={<span className="text-gray-400">Public App</span>}
            valuePropName="checked"
          >
            <Switch className="dark-switch" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-electric-blue hover:bg-electric-blue/90 border-0 text-black font-medium hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-200"
              >
                Update Integration
              </Button>
              <Button 
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedIntegration(null);
                  editForm.resetFields();
                }}
                className="border-dark-border text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CrossAppIntegrations;
