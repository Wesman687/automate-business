import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Modal, Form, Input, Select, Switch, message, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, KeyOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface AppIntegration {
  id: number;
  app_id: string;
  app_name: string;
  app_domain: string;
  app_url?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  permissions: string[];
  max_users?: number;
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
  app_url?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  permissions: string[];
  max_users?: number;
  is_public: boolean;
  webhook_url?: string;
  allowed_origins?: string[];
}

const CrossAppIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<AppIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const permissions = [
    'read_user_info',
    'read_credits',
    'purchase_credits',
    'consume_credits',
    'manage_subscriptions',
    'read_analytics'
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cross-app/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      } else {
        message.error('Failed to fetch integrations');
      }
    } catch (error) {
      message.error('Error fetching integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: CreateAppForm) => {
    try {
      const response = await fetch('/api/admin/cross-app/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();
        message.success('App integration created successfully!');
        message.info(`API Key: ${result.api_key} - Save this securely!`);
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchIntegrations();
      } else {
        const error = await response.json();
        message.error(error.detail || 'Failed to create integration');
      }
    } catch (error) {
      message.error('Error creating integration');
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${selectedIntegration.app_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('App integration updated successfully!');
        setEditModalVisible(false);
        setSelectedIntegration(null);
        editForm.resetFields();
        fetchIntegrations();
      } else {
        const error = await response.json();
        message.error(error.detail || 'Failed to update integration');
      }
    } catch (error) {
      message.error('Error updating integration');
    }
  };

  const handleApprove = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${appId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('App integration approved!');
        fetchIntegrations();
      } else {
        message.error('Failed to approve integration');
      }
    } catch (error) {
      message.error('Error approving integration');
    }
  };

  const handleSuspend = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${appId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Admin suspension' }),
      });

      if (response.ok) {
        message.success('App integration suspended!');
        fetchIntegrations();
      } else {
        message.error('Failed to suspend integration');
      }
    } catch (error) {
      message.error('Error suspending integration');
    }
  };

  const handleActivate = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${appId}/activate`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('App integration activated!');
        fetchIntegrations();
      } else {
        message.error('Failed to activate integration');
      }
    } catch (error) {
      message.error('Error activating integration');
    }
  };

  const handleRegenerateApiKey = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${appId}/regenerate-api-key`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        message.success('API key regenerated successfully!');
        message.info(`New API Key: ${result.new_api_key} - Save this securely!`);
        fetchIntegrations();
      } else {
        message.error('Failed to regenerate API key');
      }
    } catch (error) {
      message.error('Error regenerating API key');
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/cross-app/integrations/${appId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('App integration deleted!');
        fetchIntegrations();
      } else {
        message.error('Failed to delete integration');
      }
    } catch (error) {
      message.error('Error deleting integration');
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
      title: 'App ID',
      dataIndex: 'app_id',
      key: 'app_id',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: 'Name',
      dataIndex: 'app_name',
      key: 'app_name',
    },
    {
      title: 'Domain',
      dataIndex: 'app_domain',
      key: 'app_domain',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions.map(perm => (
            <Tag key={perm} size="small">{perm}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: AppIntegration) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedIntegration(record);
                setEditModalVisible(true);
                editForm.setFieldsValue(record);
              }}
            />
          </Tooltip>
          
          {record.status === 'pending_approval' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleApprove(record.app_id)}
            >
              Approve
            </Button>
          )}
          
          {record.status === 'active' && (
            <Button
              danger
              size="small"
              onClick={() => handleSuspend(record.app_id)}
            >
              Suspend
            </Button>
          )}
          
          {record.status === 'suspended' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleActivate(record.app_id)}
            >
              Activate
            </Button>
          )}
          
          <Tooltip title="Regenerate API Key">
            <Button
              icon={<KeyOutlined />}
              size="small"
              onClick={() => handleRegenerateApiKey(record.app_id)}
            />
          </Tooltip>
          
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.app_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="cross-app-integrations">
      <Card
        title="Cross-App Integrations"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add New App
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={integrations}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New App Integration"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="app_name"
            label="App Name"
            rules={[{ required: true, message: 'Please enter app name' }]}
          >
            <Input placeholder="My Awesome App" />
          </Form.Item>

          <Form.Item
            name="app_domain"
            label="App Domain"
            rules={[{ required: true, message: 'Please enter app domain' }]}
          >
            <Input placeholder="myapp.com" />
          </Form.Item>

          <Form.Item
            name="app_url"
            label="App URL"
          >
            <Input placeholder="https://myapp.com" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Brief description of the app" />
          </Form.Item>

          <Form.Item
            name="logo_url"
            label="Logo URL"
          >
            <Input placeholder="https://myapp.com/logo.png" />
          </Form.Item>

          <Form.Item
            name="primary_color"
            label="Primary Color"
          >
            <Input placeholder="#3B82F6" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              options={permissions.map(perm => ({ label: perm, value: perm }))}
            />
          </Form.Item>

          <Form.Item
            name="max_users"
            label="Max Users"
          >
            <Input type="number" placeholder="1000" />
          </Form.Item>

          <Form.Item
            name="is_public"
            label="Public App"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="webhook_url"
            label="Webhook URL"
          >
            <Input placeholder="https://myapp.com/webhook" />
          </Form.Item>

          <Form.Item
            name="allowed_origins"
            label="Allowed Origins"
          >
            <Select
              mode="tags"
              placeholder="Add allowed origins"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Integration
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
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
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="app_name"
            label="App Name"
            rules={[{ required: true, message: 'Please enter app name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="app_domain"
            label="App Domain"
            rules={[{ required: true, message: 'Please enter app domain' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="app_url"
            label="App URL"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="logo_url"
            label="Logo URL"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="primary_color"
            label="Primary Color"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              options={permissions.map(perm => ({ label: perm, value: perm }))}
            />
          </Form.Item>

          <Form.Item
            name="max_users"
            label="Max Users"
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="is_public"
            label="Public App"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="webhook_url"
            label="Webhook URL"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="allowed_origins"
            label="Allowed Origins"
          >
            <Select
              mode="tags"
              placeholder="Add allowed origins"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Integration
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setSelectedIntegration(null);
                editForm.resetFields();
              }}>
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
