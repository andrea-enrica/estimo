import { Pagination } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { PaginatedResponseDto } from "../utils/dtos/PaginatedResponseDto";
import {
  LazyQueryUsersTrigger,
  LazyQuerySessionTrigger
} from "../utils/EndpointsTypes";
interface IOwnProps<T> {
  getPagedData: LazyQueryUsersTrigger | LazyQuerySessionTrigger;
  columns: ColumnsType<T>;
  data: PaginatedResponseDto<T>;
  isLoading: boolean;
  isFetching: boolean;
}

const GenericPaginatedTable = <T extends object>({
  getPagedData,
  columns,
  data,
  isLoading,
  isFetching
}: IOwnProps<T>) => {
  const [tableData, setTableData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalElements, setTotalElements] = useState<number>(10);

  useEffect(() => {
    if (data) {
      setTableData(data.content);
      setTotalElements(data.totalElements);
    }
  }, [data]);

  useEffect(() => {
    getPagedData({ page: currentPage - 1, size: pageSize });
  }, [getPagedData, currentPage, pageSize]);

  return (
    <div className="generic-table-container">
      <Table
        className="generic-table-container"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey="id"
      />
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalElements}
          showSizeChanger
          pageSizeOptions={["5", "10", "20"]}
          onChange={(newPage, newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(pageSize !== newPageSize ? 1 : newPage);
          }}
        />
      </div>
    </div>
  );
};

export default GenericPaginatedTable;
