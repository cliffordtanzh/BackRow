"""
Revision ID: rename_summaryid_to_id
Revises: 
Create Date: 2026-05-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'rename_summaryid_to_id'
down_revision = 'ec470c08d2e3'
branch_labels = None
depends_on = None


def upgrade():
    # TeamResult: summaryID -> ID
    with op.batch_alter_table('team_result', schema=None) as batch_op:
        batch_op.alter_column('summaryID', new_column_name='ID')
    # PlayerResult: summaryID -> ID
    with op.batch_alter_table('player_result', schema=None) as batch_op:
        batch_op.alter_column('summaryID', new_column_name='ID')
        
    # TeamEvent: summaryID -> resultID
    with op.batch_alter_table('team_event', schema=None) as batch_op:
        batch_op.alter_column('summaryID', new_column_name='resultID')
    # PlayerEvent: summaryID -> resultID
    with op.batch_alter_table('player_event', schema=None) as batch_op:
        batch_op.alter_column('summaryID', new_column_name='resultID')


def downgrade():
    # TeamResult: ID -> summaryID
    with op.batch_alter_table('team_result', schema=None) as batch_op:
        batch_op.alter_column('ID', new_column_name='summaryID')
    # PlayerResult: ID -> summaryID
    with op.batch_alter_table('player_result', schema=None) as batch_op:
        batch_op.alter_column('ID', new_column_name='summaryID')

    # # TeamEvent: summaryID -> resultID
    with op.batch_alter_table('team_event', schema=None) as batch_op:
        batch_op.alter_column('resultID', new_column_name='summaryID')
    # PlayerEvent: summaryID -> resultID
    with op.batch_alter_table('player_event', schema=None) as batch_op:
        batch_op.alter_column('resultID', new_column_name='summaryID')
