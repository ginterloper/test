import React, { useState, useEffect } from 'react';
import { Layout, Table, Pagination, Select } from 'antd';
import axios from 'axios';
const { Option } = Select;

const { Content } = Layout;

const App = () => {
  const [marks, setMarks] = useState([]);
  const [selectedMark, setSelectedMark] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [stock, setStock] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await axios.get('/api/marks');
        setMarks(res.data);
      } catch (error) {
        console.error('Error fetching marks:', error);
      }
    };
    fetchMarks();
  }, []);

  useEffect(() => {
    if (selectedMark) {
      const fetchModels = async () => {
        try {
          const res = await axios.get('/api/models', {
            params: { mark: selectedMark }
          });
          setModels(res.data);
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      };
      fetchModels();
    }
  }, [selectedMark]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axios.get('/api/stock', {
          params: {
            mark: selectedMark,
            models: selectedModels.join(','),
            page,
          },
        });
        setStock(res.data.stock);
        setTotal(res.data.total);
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    };
    fetchStock();
  }, [selectedMark, selectedModels, page]);

  const columns = [
    { title: 'ID', dataIndex: '_id' },
    { title: 'Марка/Модель', dataIndex: 'model', render: (text, record) => `${record.mark} ${record.model}` },
    { title: 'Модификация', dataIndex: 'drive', render: (text, record) => `${record.engine.volume.toFixed(1)} ${record.engine.transmission} (${record.engine.power} л.с.) ${text}` },
    { title: 'Комплектация', dataIndex: 'equipmentName' },
    { title: 'Стоимость', dataIndex: 'price', render: price => `${price.toLocaleString()} ₽` },
    { title: 'Дата создания', dataIndex: 'createdAt', render: date => new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ];

  return (
    <Layout>
      <Content style={{ padding: '50px' }}>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          {marks.map(mark => (
            <a
              key={mark.mark}
              href="#"
              onClick={() => setSelectedMark(mark.mark)}
              style={{ display: 'block', margin: '8px 5px' }}
            >
              {mark.mark} ({mark.count})
            </a>
          ))}
        </div>
        <Select
          mode="multiple"
          placeholder="Выберите модели"
          style={{ width: 200, marginTop: 16 }}
          onChange={values => setSelectedModels(values)}
          disabled={!selectedMark}
        >
          {models.map(model => (
            <Option key={model} value={model}>
              {model}
            </Option>
          ))}
        </Select>
        <Table
          columns={columns}
          dataSource={stock}
          rowKey="_id"
          pagination={false}
          style={{ marginTop: 16 }}
        />
        <Pagination
          total={total}
          pageSize={20}
          current={page}
          onChange={page => setPage(page)}
          style={{ marginTop: 16, textAlign: 'center' }}
        />
      </Content>
    </Layout>
  );
};

export default App;
